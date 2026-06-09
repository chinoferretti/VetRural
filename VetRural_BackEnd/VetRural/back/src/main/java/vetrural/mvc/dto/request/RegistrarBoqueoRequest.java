package vetrural.mvc.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import vetrural.mvc.enumerations.DentaduraEnum;
import vetrural.mvc.enumerations.DeterioroEnum;
import vetrural.mvc.enumerations.DientesEnum;

@Data
public class RegistrarBoqueoRequest {
    @NotNull
    private Long bovinoId;

    @NotNull
    private Long registradoPorId;

    @NotNull
    private DientesEnum dientes;

    private DeterioroEnum deterioro;

    private DentaduraEnum dentadura;
}
