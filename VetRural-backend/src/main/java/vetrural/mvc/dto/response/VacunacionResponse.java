package vetrural.mvc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vetrural.mvc.enumerations.VacunaTipoEnum;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VacunacionResponse {
    private Long id;
    private LocalDateTime fechaHora;
    private Long bovinoId;
    private Long sesionId;
    private VacunaTipoEnum vacuna;
}
