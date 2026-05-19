package vetrural.mvc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vetrural.mvc.enumerations.PeriodoEnum;
import vetrural.mvc.enumerations.RazaBovinoEnum;
import vetrural.mvc.enumerations.SexoEnum;
import vetrural.mvc.enumerations.TipoBovinoEnum;
import vetrural.mvc.enumerations.DentaduraEnum;
import vetrural.mvc.enumerations.DeterioroEnum;
import vetrural.mvc.enumerations.DientesEnum;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistorialBovinoResponse {
    private Long id;
    private String caravana;
    private Long establecimientoId;
    private LocalDate nacimiento;
    private SexoEnum sexo;
    private String lote;
    private RazaBovinoEnum raza;
    private TipoBovinoEnum tipo;
    private BoqueoHistorialResponse boqueo;
    private PesajeHistorialResponse pesaje;
    private TactoHistorialResponse tacto;
    private VacunacionHistorialResponse vacunaciones;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BoqueoHistorialResponse {
        private DientesEnum dientes;
        private DeterioroEnum deterioro;
        private DentaduraEnum dentadura;
        private LocalDateTime fechaHora;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PesajeHistorialResponse {
        private Double peso;
        private LocalDateTime fechaHora;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TactoHistorialResponse {
        private vetrural.mvc.enumerations.SituacionEnum situacion;
        private PeriodoEnum periodo;
        private LocalDateTime fechaHora;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VacunacionHistorialResponse {
        private LocalDate aftosa;
        private LocalDate brucelosis;
        private LocalDate carbunco;
        private LocalDate clostridial;
        private LocalDate ibr;
        private LocalDate bvd;
    }
}
