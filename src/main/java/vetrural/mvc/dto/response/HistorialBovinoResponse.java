package vetrural.mvc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistorialBovinoResponse {
    private BovinoResponse bovino;
    private BoqueoResponse boqueo;
    private PesajeResponse pesaje;
    private TactoResponse tacto;
    private List<VacunacionResponse> vacunaciones;
}
