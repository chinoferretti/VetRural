package vetrural.mvc.dto.request;

import lombok.Data;
import vetrural.mvc.enumerations.SexoEnum;

@Data
public class CrearBovinoRapidoRequest {
    private String id;
    private Long establecimientoId;
    private SexoEnum sexo;
}
