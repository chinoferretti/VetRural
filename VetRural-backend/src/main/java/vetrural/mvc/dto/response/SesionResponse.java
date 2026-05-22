package vetrural.mvc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SesionResponse {
    private Long id;
    private LocalDateTime fechaHora;
    private Long veterinarioId;
    private String veterinarioNombre;
    private String anotador;
    private Long establecimientoId;
    private String establecimientoNombre;
}
