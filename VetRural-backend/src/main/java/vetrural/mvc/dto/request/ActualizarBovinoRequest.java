package vetrural.mvc.dto.request;

import lombok.Data;
import vetrural.mvc.enumerations.RazaBovinoEnum;
import vetrural.mvc.enumerations.SexoEnum;
import vetrural.mvc.enumerations.TipoBovinoEnum;
import java.time.LocalDate;

@Data
public class ActualizarBovinoRequest {
    private String caravana;
    private Long establecimientoId;
    private SexoEnum sexo;
    private LocalDate nacimiento;
    private String lote;
    private RazaBovinoEnum raza;
    private TipoBovinoEnum tipo;
    private String obs;
}
