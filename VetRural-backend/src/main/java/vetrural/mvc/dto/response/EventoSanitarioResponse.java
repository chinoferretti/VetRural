package vetrural.mvc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoSanitarioResponse {
    private Long id;
    private String tipo;
    private LocalDateTime fechaHora;
    private Long bovinoId;
    private Long sesionId;
}
