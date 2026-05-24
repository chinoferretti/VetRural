package vetrural.mvc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vetrural.mvc.enumerations.TipoUsuarioEnum;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {
    private Long idUsuario;
    private String nombre;
    private String apellido;
    private String email;
    private TipoUsuarioEnum tipo;
}
