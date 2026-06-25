package vetrural.mvc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vetrural.mvc.enumerations.DentaduraEnum;
import vetrural.mvc.enumerations.DeterioroEnum;
import vetrural.mvc.enumerations.DientesEnum;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoqueoResponse {
    private Long id;
    private LocalDateTime fechaHora;
    private Long bovinoId;
    private Long registradoPorId;
    private DientesEnum dientes;
    private DeterioroEnum deterioro;
    private DentaduraEnum dentadura;
}
