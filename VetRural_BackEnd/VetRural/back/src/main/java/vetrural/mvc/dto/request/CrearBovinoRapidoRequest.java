package vetrural.mvc.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import vetrural.mvc.enumerations.SexoEnum;

@Data
public class CrearBovinoRapidoRequest {
    @NotBlank
    private String caravana;

    @NotNull
    private Long establecimientoId;

    @NotNull
    private SexoEnum sexo;
}
