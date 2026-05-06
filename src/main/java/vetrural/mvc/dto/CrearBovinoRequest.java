package vetrural.mvc.dto;

import lombok.Data;
import vetrural.mvc.enumerations.RazaBovinoEnum;
import vetrural.mvc.enumerations.SexoEnum;
import vetrural.mvc.enumerations.TipoBovinoEnum;
import java.time.LocalDate;

@Data
public class CrearBovinoRequest {
    private String id;
    private LocalDate nacimiento;
    private SexoEnum sexo;
    private String obs;
    private RazaBovinoEnum raza;
    private TipoBovinoEnum tipo;
}
