package vetrural.mvc.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrearEstablecimientoRequest {
    @NotBlank
    private String nombre;
}
