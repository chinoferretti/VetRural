package vetrural.mvc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vetrural.mvc.enumerations.EstadoBovinoEnum;
import vetrural.mvc.enumerations.RazaBovinoEnum;
import vetrural.mvc.enumerations.SexoEnum;
import vetrural.mvc.enumerations.TipoBovinoEnum;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BovinoResponse {
    private Long id;
    private String caravana;
    private Long establecimientoId;
    private RazaBovinoEnum raza;
    private TipoBovinoEnum tipo;
    private SexoEnum sexo;
    private LocalDate nacimiento;
    private String lote;
    private String observaciones;
    private String apodo;
    private EstadoBovinoEnum estado;
    private LocalDate fechaBaja;
}
