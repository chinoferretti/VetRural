package vetrural.mvc.dto;

import lombok.Data;
import vetrural.mvc.enumerations.PeriodoEnum;
import vetrural.mvc.enumerations.SituacionEnum;

@Data
public class RegistrarTactoRequest {
    private String idBovino;
    private SituacionEnum situacion;
    private PeriodoEnum periodo;
}
