package vetrural.mvc.dto.request;

import lombok.Data;
import vetrural.mvc.enumerations.PeriodoEnum;
import vetrural.mvc.enumerations.SituacionEnum;

@Data
public class RegistrarTactoRequest {
    private String bovinoId;
    private Long registradoPorId;
    private SituacionEnum situacion;
    private PeriodoEnum periodo;
}
