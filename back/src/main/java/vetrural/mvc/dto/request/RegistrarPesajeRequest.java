package vetrural.mvc.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class RegistrarPesajeRequest {
    @NotNull
    private Long bovinoId;

    @NotNull
    private Long registradoPorId;

    @Positive
    private double peso;
}
