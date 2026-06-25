package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vetrural.mvc.dto.response.AlertaBovino;
import vetrural.mvc.dto.response.MetricasResponse;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Boqueo;
import vetrural.mvc.entity.Pesaje;
import vetrural.mvc.entity.Tacto;
import vetrural.mvc.entity.Vacunacion;
import vetrural.mvc.enumerations.DentaduraEnum;
import vetrural.mvc.enumerations.DeterioroEnum;
import vetrural.mvc.enumerations.DientesEnum;
import vetrural.mvc.enumerations.SexoEnum;
import vetrural.mvc.enumerations.SituacionEnum;
import vetrural.mvc.enumerations.TipoBovinoEnum;
import vetrural.mvc.enumerations.VacunaTipoEnum;
import vetrural.mvc.repository.BoqueoRepository;
import vetrural.mvc.repository.PesajeRepository;
import vetrural.mvc.repository.TactoRepository;
import vetrural.mvc.repository.VacunacionRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MetricasService {

    @Autowired private BovinoService      bovinoService;
    @Autowired private BoqueoRepository   boqueoRepository;
    @Autowired private PesajeRepository   pesajeRepository;
    @Autowired private TactoRepository    tactoRepository;
    @Autowired private VacunacionRepository vacunacionRepository;

    private static final Map<VacunaTipoEnum, Long> INTERVALO_DIAS;
    static {
        INTERVALO_DIAS = new EnumMap<>(VacunaTipoEnum.class);
        INTERVALO_DIAS.put(VacunaTipoEnum.Aftosa,      180L);
        INTERVALO_DIAS.put(VacunaTipoEnum.Brucelosis,  36500L);
        INTERVALO_DIAS.put(VacunaTipoEnum.Carbunco,    365L);
        INTERVALO_DIAS.put(VacunaTipoEnum.Clostridial, 365L);
        INTERVALO_DIAS.put(VacunaTipoEnum.IBR,         365L);
        INTERVALO_DIAS.put(VacunaTipoEnum.BVD,         365L);
        INTERVALO_DIAS.put(VacunaTipoEnum.IBR_BVD,     365L);
    }

    private static final Map<TipoBovinoEnum, int[]> RANGOS_PESO;
    static {
        RANGOS_PESO = new EnumMap<>(TipoBovinoEnum.class);
        RANGOS_PESO.put(TipoBovinoEnum.Ternera,    new int[]{50,  290});
        RANGOS_PESO.put(TipoBovinoEnum.Ternero,    new int[]{50,  290});
        RANGOS_PESO.put(TipoBovinoEnum.Novillito,  new int[]{150, 370});
        RANGOS_PESO.put(TipoBovinoEnum.Novillo,    new int[]{260, 520});
        RANGOS_PESO.put(TipoBovinoEnum.Vaquillona, new int[]{160, 390});
        RANGOS_PESO.put(TipoBovinoEnum.Vaca,       new int[]{300, 680});
        RANGOS_PESO.put(TipoBovinoEnum.Torito,     new int[]{150, 400});
        RANGOS_PESO.put(TipoBovinoEnum.Toro,       new int[]{350, 900});
    }

    @Transactional(readOnly = true)
    public MetricasResponse calcular(Long establecimientoId, SexoEnum sexo, String lote) {

        List<Bovino> bovinos = bovinoService.listarBovinosPorEstablecimiento(establecimientoId);

        if (sexo != null)
            bovinos = bovinos.stream().filter(b -> sexo.equals(b.getSexo())).collect(Collectors.toList());
        if (lote != null && !lote.isBlank())
            bovinos = bovinos.stream().filter(b -> lote.equals(b.getLote())).collect(Collectors.toList());

        Set<Long> bovinoIds = bovinos.stream().map(Bovino::getId).collect(Collectors.toSet());

        // ── Batch load last-event-per-bovino ────────────────────────────────
        Map<Long, Pesaje>  ultimoPesaje  = batchUltimoPesaje(establecimientoId, bovinoIds);
        Map<Long, Tacto>   ultimoTacto   = batchUltimoTacto(establecimientoId, bovinoIds);
        Map<Long, Boqueo>  ultimoBoqueo  = batchUltimoBoqueo(establecimientoId, bovinoIds);
        Map<Long, List<Vacunacion>> vacsByBovino = batchVacunaciones(establecimientoId, bovinoIds);

        int total   = bovinos.size();
        int hembras = (int) bovinos.stream().filter(b -> SexoEnum.Hembra.equals(b.getSexo())).count();
        int machos  = total - hembras;

        // ── Edad promedio ────────────────────────────────────────────────────
        LocalDate hoy = LocalDate.now();
        List<Long> mesesEdad = new ArrayList<>();
        int bovinosConEdadEstimada = 0;
        for (Bovino b : bovinos) {
            if (b.getNacimiento() != null) {
                mesesEdad.add(ChronoUnit.MONTHS.between(b.getNacimiento(), hoy));
            } else {
                Boqueo bq = ultimoBoqueo.get(b.getId());
                if (bq != null) {
                    Long meses = estimarMesesPorBoqueo(bq);
                    if (meses != null) { mesesEdad.add(meses); bovinosConEdadEstimada++; }
                }
            }
        }
        Integer edadPromedio = mesesEdad.isEmpty() ? null
                : (int) mesesEdad.stream().mapToLong(Long::longValue).average().orElse(0);

        // ── Peso promedio ────────────────────────────────────────────────────
        List<Double> pesos = bovinos.stream()
                .map(b -> ultimoPesaje.get(b.getId()))
                .filter(Objects::nonNull)
                .map(Pesaje::getPeso)
                .collect(Collectors.toList());
        int conPeso = pesos.size();
        Double pesoPromedio = pesos.isEmpty() ? null
                : Math.round(pesos.stream().mapToDouble(Double::doubleValue).average().orElse(0) * 10) / 10.0;

        // ── Preñez + distribución tacto ──────────────────────────────────────
        List<Bovino> hembrasList = bovinos.stream()
                .filter(b -> SexoEnum.Hembra.equals(b.getSexo())).collect(Collectors.toList());
        int prenadas = 0, totalTactadas = 0;
        Map<String, Integer> distribucionTacto = new LinkedHashMap<>();
        for (Bovino h : hembrasList) {
            Tacto t = ultimoTacto.get(h.getId());
            if (t != null) {
                totalTactadas++;
                if (SituacionEnum.Preñada.equals(t.getSituacion())) prenadas++;
                if (t.getSituacion() != null)
                    distribucionTacto.merge(t.getSituacion().name(), 1, Integer::sum);
            }
        }
        int pctPrenez = totalTactadas > 0 ? Math.round((float) prenadas / totalTactadas * 100) : 0;

        // ── Vacunación: alguna vez + vigente ─────────────────────────────────
        Map<String, Integer> vacunados         = new LinkedHashMap<>();
        Map<String, Integer> vacunadosVigentes = new LinkedHashMap<>();
        for (VacunaTipoEnum v : VacunaTipoEnum.values()) {
            vacunados.put(v.name(), 0);
            vacunadosVigentes.put(v.name(), 0);
        }
        for (Bovino b : bovinos) {
            List<Vacunacion> vacs = vacsByBovino.getOrDefault(b.getId(), Collections.emptyList());
            for (VacunaTipoEnum tipo : VacunaTipoEnum.values()) {
                Optional<Vacunacion> ultima = vacs.stream()
                        .filter(v -> tipo.equals(v.getVacuna()))
                        .max(Comparator.comparing(v -> v.getFechaHora()));
                if (ultima.isPresent()) {
                    vacunados.merge(tipo.name(), 1, Integer::sum);
                    long diasTranscurridos = ChronoUnit.DAYS.between(ultima.get().getFechaHora().toLocalDate(), hoy);
                    long intervalo = INTERVALO_DIAS.getOrDefault(tipo, 365L);
                    if (diasTranscurridos <= intervalo)
                        vacunadosVigentes.merge(tipo.name(), 1, Integer::sum);
                }
            }
        }

        // ── Lotes ────────────────────────────────────────────────────────────
        List<String> lotes = bovinos.stream()
                .map(Bovino::getLote).filter(l -> l != null && !l.isBlank())
                .distinct().sorted().collect(Collectors.toList());

        // ── Distribución por tipo ────────────────────────────────────────────
        Map<String, Integer> distribucionTipo = new LinkedHashMap<>();
        bovinos.forEach(b -> distribucionTipo.merge(
                b.getTipo() != null ? b.getTipo().name() : "Sin_Categoria", 1, Integer::sum));

        // ── Distribución por dientes ──────────────────────────────────────────
        Map<String, Integer> distribucionDientes = new LinkedHashMap<>();
        bovinos.forEach(b -> {
            Boqueo bq = ultimoBoqueo.get(b.getId());
            if (bq != null && bq.getDientes() != null)
                distribucionDientes.merge(bq.getDientes().name(), 1, Integer::sum);
        });

        // ── Distribución por deterioro ────────────────────────────────────────
        Map<String, Integer> distribucionDeterioro = new LinkedHashMap<>();
        bovinos.forEach(b -> {
            Boqueo bq = ultimoBoqueo.get(b.getId());
            if (bq != null && bq.getDeterioro() != null)
                distribucionDeterioro.merge(bq.getDeterioro().name(), 1, Integer::sum);
        });

        // ── Alertas ───────────────────────────────────────────────────────────
        List<AlertaBovino> alertas = calcularAlertas(bovinos, hoy, ultimoPesaje, ultimoTacto, ultimoBoqueo, vacsByBovino);

        return new MetricasResponse(total, hembras, machos, edadPromedio, bovinosConEdadEstimada,
                pesoPromedio, conPeso, prenadas, totalTactadas, pctPrenez,
                vacunados, vacunadosVigentes, lotes,
                distribucionTipo, distribucionDientes, distribucionDeterioro,
                distribucionTacto, alertas);
    }

    private Map<Long, Pesaje> batchUltimoPesaje(Long estId, Set<Long> bovinoIds) {
        return pesajeRepository.findUltimosPorEstablecimiento(estId).stream()
                .filter(p -> bovinoIds.contains(p.getBovino().getId()))
                .collect(Collectors.toMap(
                        p -> p.getBovino().getId(), p -> p,
                        (a, b) -> a.getFechaHora().isAfter(b.getFechaHora()) ? a : b));
    }

    private Map<Long, Tacto> batchUltimoTacto(Long estId, Set<Long> bovinoIds) {
        return tactoRepository.findUltimosPorEstablecimiento(estId).stream()
                .filter(t -> bovinoIds.contains(t.getBovino().getId()))
                .collect(Collectors.toMap(
                        t -> t.getBovino().getId(), t -> t,
                        (a, b) -> a.getFechaHora().isAfter(b.getFechaHora()) ? a : b));
    }

    private Map<Long, Boqueo> batchUltimoBoqueo(Long estId, Set<Long> bovinoIds) {
        return boqueoRepository.findUltimosPorEstablecimiento(estId).stream()
                .filter(b -> bovinoIds.contains(b.getBovino().getId()))
                .collect(Collectors.toMap(
                        b -> b.getBovino().getId(), b -> b,
                        (a, b) -> a.getFechaHora().isAfter(b.getFechaHora()) ? a : b));
    }

    private Map<Long, List<Vacunacion>> batchVacunaciones(Long estId, Set<Long> bovinoIds) {
        return vacunacionRepository.findAllByEstablecimientoId(estId).stream()
                .filter(v -> bovinoIds.contains(v.getBovino().getId()))
                .collect(Collectors.groupingBy(v -> v.getBovino().getId()));
    }

    private List<AlertaBovino> calcularAlertas(List<Bovino> bovinos, LocalDate hoy,
                                               Map<Long, Pesaje>  ultimoPesaje,
                                               Map<Long, Tacto>   ultimoTacto,
                                               Map<Long, Boqueo>  ultimoBoqueo,
                                               Map<Long, List<Vacunacion>> vacsByBovino) {
        List<AlertaBovino> alertas = new ArrayList<>();

        for (Bovino b : bovinos) {
            String car = b.getCaravana();
            List<Vacunacion> vacs = vacsByBovino.getOrDefault(b.getId(), Collections.emptyList());

            Tacto t = ultimoTacto.get(b.getId());
            if (t != null && SituacionEnum.Frigorífico.equals(t.getSituacion()))
                alertas.add(new AlertaBovino(car, "Marcada para frigorífico"));

            boolean aftosaVigente = vacs.stream()
                    .filter(v -> VacunaTipoEnum.Aftosa.equals(v.getVacuna()))
                    .max(Comparator.comparing(v -> v.getFechaHora()))
                    .map(v -> ChronoUnit.DAYS.between(v.getFechaHora().toLocalDate(), hoy) <= 180)
                    .orElse(false);
            if (!aftosaVigente)
                alertas.add(new AlertaBovino(car, "Sin Aftosa vigente (obligatoria cada 6 meses)"));

            for (VacunaTipoEnum tipo : new VacunaTipoEnum[]{
                    VacunaTipoEnum.Carbunco, VacunaTipoEnum.Clostridial,
                    VacunaTipoEnum.IBR, VacunaTipoEnum.BVD}) {
                vacs.stream()
                    .filter(v -> tipo.equals(v.getVacuna()))
                    .max(Comparator.comparing(v -> v.getFechaHora()))
                    .ifPresent(ultima -> {
                        long dias = ChronoUnit.DAYS.between(ultima.getFechaHora().toLocalDate(), hoy);
                        if (dias > 365)
                            alertas.add(new AlertaBovino(car,
                                    tipo.name() + " vencida (hace " + (dias / 30) + " meses)"));
                    });
            }

            if (b.getTipo() != null) {
                int[] rango = RANGOS_PESO.get(b.getTipo());
                Pesaje p = ultimoPesaje.get(b.getId());
                if (rango != null && p != null) {
                    double peso = p.getPeso();
                    if (peso < rango[0])
                        alertas.add(new AlertaBovino(car,
                                "Peso bajo para " + b.getTipo().name() +
                                ": " + (int) peso + " kg (mín. " + rango[0] + " kg)"));
                    else if (peso > rango[1])
                        alertas.add(new AlertaBovino(car,
                                "Peso alto para " + b.getTipo().name() +
                                ": " + (int) peso + " kg (máx. " + rango[1] + " kg)"));
                }
            }

            Boqueo bq = ultimoBoqueo.get(b.getId());
            if (bq != null
                    && DientesEnum.Ocho.equals(bq.getDientes())
                    && DentaduraEnum.Permanente.equals(bq.getDentadura())
                    && (DeterioroEnum.Moderado.equals(bq.getDeterioro())
                        || DeterioroEnum.Severo.equals(bq.getDeterioro())))
                alertas.add(new AlertaBovino(car,
                        "Edad avanzada (boca llena, desgaste " +
                        bq.getDeterioro().name().toLowerCase() + ")"));
        }

        return alertas;
    }

    private Long estimarMesesPorBoqueo(Boqueo boqueo) {
        DientesEnum   dientes   = boqueo.getDientes();
        DentaduraEnum dentadura = boqueo.getDentadura();
        DeterioroEnum deterioro = boqueo.getDeterioro();
        if (dientes == null) return null;

        if (DentaduraEnum.De_Leche.equals(dentadura)) return 12L;

        if (DentaduraEnum.Mixta.equals(dentadura)) {
            switch (dientes) {
                case Dos:    return 21L;
                case Cuatro: return 33L;
                case Seis:   return 45L;
                case Ocho:   return 54L;
                default:     return null;
            }
        }

        if (DentaduraEnum.Permanente.equals(dentadura)) {
            switch (dientes) {
                case Dos:    return 24L;
                case Cuatro: return 36L;
                case Seis:   return 48L;
                case Ocho:
                    if (deterioro == null || DeterioroEnum.Nulo.equals(deterioro)) return 66L;
                    switch (deterioro) {
                        case Leve:     return 78L;
                        case Moderado: return 96L;
                        case Severo:   return 120L;
                        default:       return 66L;
                    }
                default: return null;
            }
        }

        switch (dientes) {
            case Dos:    return 21L;
            case Cuatro: return 33L;
            case Seis:   return 45L;
            case Ocho:   return 60L;
            default:     return null;
        }
    }
}
