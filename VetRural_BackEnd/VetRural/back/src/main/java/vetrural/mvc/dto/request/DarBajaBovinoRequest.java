package vetrural.mvc.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import vetrural.mvc.enumerations.EstadoBovinoEnum;

@Data
public class DarBajaBovinoRequest {
    @NotNull
    private EstadoBovinoEnum estado;

    private String motivoBaja;
}
