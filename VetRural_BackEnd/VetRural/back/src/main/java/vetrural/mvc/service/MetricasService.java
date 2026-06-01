package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vetrural.mvc.dto.response.MetricasResponse;
import vetrural.mvc.entity.Bovino;
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
    @Autowired private VacunacionService vacunacionService;

    @Transactional(readOnly = true)
    public MetricasResponse calcular(Long establecimientoId, SexoEnum sexo, String lote) {

        List<Bovino> bovinos = bovinoService.listarBovinosPorEstablecimiento(establecimientoId);

        // Aplicar filtros opcionales
        if (sexo != null) {
            bovinos = bovinos.stream().filter(b -> sexo.equals(b.getSexo())).collect(Collectors.toList());
        }
        if (lote != null && !lote.isBlank()) {
            bovinos = bovinos.stream().filter(b -> lote.equals(b.getLote())).collect(Collectors.toList());
        }

        int total   = bovinos.size();
        int hembras = (int) bovinos.stream().filter(b -> SexoEnum.Hembra.equals(b.getSexo())).count();
        int machos  = total - hembras;

        // Edad promedio (en meses)
        LocalDate hoy = LocalDate.now();
        List<Long> mesesEdad = bovinos.stream()
                .filter(b -> b.getNacimiento() != null)
                .map(b -> ChronoUnit.MONTHS.between(b.getNacimiento(), hoy))
                .collect(Collectors.toList());
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

        // Preñez (solo hembras, último tacto)
        List<Bovino> hembrasList = bovinos.stream()
                .filter(b -> SexoEnum.Hembra.equals(b.getSexo()))
                .collect(Collectors.toList());
        int prenadas = 0, totalTactadas = 0;
        for (Bovino h : hembrasList) {
            var t = tactoService.getUltimoTacto(h);
            if (t.isPresent()) {
                totalTactadas++;
                if (SituacionEnum.Preñada.equals(t.get().getSituacion())) prenadas++;
            }
        }
        int pctPrenez = totalTactadas > 0 ? Math.round((float) prenadas / totalTactadas * 100) : 0;

        // Vacunación: por cada bovino, qué vacunas tiene (sin importar cuántas veces)
        Map<String, Integer> vacunados = new LinkedHashMap<>();
        for (VacunaTipoEnum v : VacunaTipoEnum.values()) vacunados.put(v.name(), 0);
        for (Bovino b : bovinos) {
            Set<VacunaTipoEnum> vacunasBovino = vacunacionService.getVacunacionesPorBovino(b)
                    .stream().map(v -> v.getVacuna()).collect(Collectors.toSet());
            for (VacunaTipoEnum v : vacunasBovino) {
                vacunados.merge(v.name(), 1, Integer::sum);
            }
        }

        // Lotes disponibles en el grupo filtrado
        List<String> lotes = bovinos.stream()
                .map(Bovino::getLote)
                .filter(l -> l != null && !l.isBlank())
                .distinct().sorted().collect(Collectors.toList());

        return new MetricasResponse(total, hembras, machos, edadPromedio, pesoPromedio,
                conPeso, prenadas, totalTactadas, pctPrenez, vacunados, lotes);
    }
}
