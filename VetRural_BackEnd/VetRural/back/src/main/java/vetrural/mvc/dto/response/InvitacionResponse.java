package vetrural.mvc.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvitacionResponse {
    private Long id;
    private Long establecimientoId;
    private String establecimientoNombre;
    private String remitente;
    private LocalDateTime fecha;
    private String invitadoNombre;
}
