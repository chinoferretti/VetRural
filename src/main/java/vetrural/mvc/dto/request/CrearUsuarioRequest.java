package vetrural.mvc.dto.request;

import lombok.Data;
import vetrural.mvc.enumerations.TipoUsuarioEnum;

@Data
public class CrearUsuarioRequest {
    private String nombre;
    private String apellido;
    private String email;
    private String contrasena;
    private TipoUsuarioEnum tipo;
}
