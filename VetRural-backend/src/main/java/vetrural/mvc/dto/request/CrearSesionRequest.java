package vetrural.mvc.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CrearSesionRequest {

    @NotNull
    private Long veterinarioId;

    private String anotador;

    @NotNull
    private Long establecimientoId;
}
