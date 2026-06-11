package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vetrural.mvc.dto.response.MetricasResponse;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.enumerations.DientesEnum;
import vetrural.mvc.enumerations.SexoEnum;
import vetrural.mvc.enumerations.SituacionEnum;
import vetrural.mvc.enumerations.VacunaTipoEnum;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MetricasService {

    @Autowired private BovinoService     bovinoService;
    @Autowired private PesajeService     pesajeService;
    @Autowired private TactoService      tactoService;
    @Autowired private BoqueoService     boqueoService;
    @Autowired private VacunacionService vacunacionService;

    @Transactional(readOnly = true)
    public MetricasResponse calcular(Long establecimientoId, SexoEnum sexo, String lote) {

        List<Bovino> bovinos = bovinoService.listarBovinosPorEstablecimiento(establecimientoId);

        if (sexo != null) {
            bovinos = bovinos.stream().filter(b -> sexo.equals(b.getSexo())).collect(Collectors.toList());
        }
        if (lote != null && !lote.isBlank()) {
            bovinos = bovinos.stream().filter(b -> lote.equals(b.getLote())).collect(Collectors.toList());
        }

        int total   = bovinos.size();
        int hembras = (int) bovinos.stream().filter(b -> SexoEnum.Hembra.equals(b.getSexo())).count();
        int machos  = total - hembras;

        // Edad promedio: usa nacimiento cuando está disponible; si no, estima por boqueo (dientes)
        LocalDate hoy = LocalDate.now();
        List<Long> mesesEdad = new ArrayList<>();
        int bovinosConEdadEstimada = 0;
        for (Bovino b : bovinos) {
            if (b.getNacimiento() != null) {
                mesesEdad.add(ChronoUnit.MONTHS.between(b.getNacimiento(), hoy));
            } else {
                var boqueo = boqueoService.getUltimoBoqueo(b);
                if (boqueo.isPresent() && boqueo.get().getDientes() != null) {
                    Long meses = estimarMesesPorDientes(boqueo.get().getDientes());
                    if (meses != null) {
                        mesesEdad.add(meses);
                        bovinosConEdadEstimada++;
                    }
                }
            }
        }
        Integer edadPromedio = mesesEdad.isEmpty() ? null
                : (int) mesesEdad.stream().mapToLong(Long::longValue).average().orElse(0);

        // Peso promedio (último pesaje de cada bovino)
        List<Double> pesos = bovinos.stream()
                .map(b -> pesajeService.getUltimoPesaje(b))
                .filter(Optional::isPresent)
                .map(opt -> opt.get().getPeso())
                .collect(Collectors.toList());
        int conPeso = pesos.size();
        Double pesoPromedio = pesos.isEmpty() ? null
                : Math.round(pesos.stream().mapToDouble(Double::doubleValue).average().orElse(0) * 10) / 10.0;

        // Preñez (solo hembras, último tacto) + distribución completa de situaciones
        List<Bovino> hembrasList = bovinos.stream()
                .filter(b -> SexoEnum.Hembra.equals(b.getSexo()))
                .collect(Collectors.toList());
        int prenadas = 0, totalTactadas = 0;
        Map<String, Integer> distribucionTacto = new LinkedHashMap<>();
        for (Bovino h : hembrasList) {
            var t = tactoService.getUltimoTacto(h);
            if (t.isPresent()) {
                totalTactadas++;
                if (SituacionEnum.Preñada.equals(t.get().getSituacion())) prenadas++;
                if (t.get().getSituacion() != null)
                    distribucionTacto.merge(t.get().getSituacion().name(), 1, Integer::sum);
            }
        }
        int pctPrenez = totalTactadas > 0 ? Math.round((float) prenadas / totalTactadas * 100) : 0;

        // Vacunación
        Map<String, Integer> vacunados = new LinkedHashMap<>();
        for (VacunaTipoEnum v : VacunaTipoEnum.values()) vacunados.put(v.name(), 0);
        for (Bovino b : bovinos) {
            Set<VacunaTipoEnum> vacunasBovino = vacunacionService.getVacunacionesPorBovino(b)
                    .stream().map(v -> v.getVacuna()).collect(Collectors.toSet());
            for (VacunaTipoEnum v : vacunasBovino) {
                vacunados.merge(v.name(), 1, Integer::sum);
            }
        }

        // Lotes disponibles
        List<String> lotes = bovinos.stream()
                .map(Bovino::getLote)
                .filter(l -> l != null && !l.isBlank())
                .distinct().sorted().collect(Collectors.toList());

        // Distribución por tipo de bovino
        Map<String, Integer> distribucionTipo = new LinkedHashMap<>();
        bovinos.forEach(b -> {
            String tipo = b.getTipo() != null ? b.getTipo().name() : "Sin_Categoria";
            distribucionTipo.merge(tipo, 1, Integer::sum);
        });

        // Distribución por dientes (último boqueo)
        Map<String, Integer> distribucionDientes = new LinkedHashMap<>();
        bovinos.forEach(b -> boqueoService.getUltimoBoqueo(b).ifPresent(bq -> {
            if (bq.getDientes() != null)
                distribucionDientes.merge(bq.getDientes().name(), 1, Integer::sum);
        }));

        // Distribución por deterioro dental (último boqueo)
        Map<String, Integer> distribucionDeterioro = new LinkedHashMap<>();
        bovinos.forEach(b -> boqueoService.getUltimoBoqueo(b).ifPresent(bq -> {
            if (bq.getDeterioro() != null)
                distribucionDeterioro.merge(bq.getDeterioro().name(), 1, Integer::sum);
        }));

        return new MetricasResponse(total, hembras, machos, edadPromedio, bovinosConEdadEstimada,
                pesoPromedio, conPeso, prenadas, totalTactadas, pctPrenez, vacunados, lotes,
                distribucionTipo, distribucionDientes, distribucionDeterioro, distribucionTacto);
    }

    private Long estimarMesesPorDientes(DientesEnum dientes) {
        switch (dientes) {
            case Dos:    return 21L;
            case Cuatro: return 33L;
            case Seis:   return 45L;
            case Ocho:   return 57L;
            default:     return null;
        }
    }
}
