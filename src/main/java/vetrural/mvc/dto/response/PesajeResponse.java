package vetrural.mvc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PesajeResponse {
    private Long id;
    private LocalDateTime fechaHora;
    private Long bovinoId;
    private Long registradoPorId;
    private double peso;
}
