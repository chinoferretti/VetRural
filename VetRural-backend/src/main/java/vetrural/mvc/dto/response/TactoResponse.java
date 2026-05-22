package vetrural.mvc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vetrural.mvc.enumerations.PeriodoEnum;
import vetrural.mvc.enumerations.SituacionEnum;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TactoResponse {
    private Long id;
    private LocalDateTime fechaHora;
    private Long bovinoId;
    private Long sesionId;
    private SituacionEnum situacion;
    private PeriodoEnum periodo;
}
