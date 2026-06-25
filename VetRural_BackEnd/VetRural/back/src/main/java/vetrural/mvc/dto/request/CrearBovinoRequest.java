package vetrural.mvc.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import vetrural.mvc.enumerations.RazaBovinoEnum;
import vetrural.mvc.enumerations.SexoEnum;
import vetrural.mvc.enumerations.TipoBovinoEnum;
import java.time.LocalDate;

@Data
public class CrearBovinoRequest {
    @NotBlank
    private String caravana;

    @NotNull
    private Long establecimientoId;

    @NotNull
    private SexoEnum sexo;

    private LocalDate nacimiento;
    private String obs;
    private String apodo;
    private RazaBovinoEnum raza;
    private TipoBovinoEnum tipo;
}
