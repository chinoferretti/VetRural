package vetrural.mvc.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import vetrural.mvc.enumerations.PeriodoEnum;
import vetrural.mvc.enumerations.SituacionEnum;

@Data
public class RegistrarTactoRequest {
    @NotNull
    private Long bovinoId;

    @NotNull
    private Long registradoPorId;

    @NotNull
    private SituacionEnum situacion;

    private PeriodoEnum periodo;
}
