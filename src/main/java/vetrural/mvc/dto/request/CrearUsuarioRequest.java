package vetrural.mvc.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import vetrural.mvc.enumerations.TipoUsuarioEnum;

@Data
public class CrearUsuarioRequest {
    @NotBlank
    private String nombre;

    @NotBlank
    private String apellido;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String contrasena;

    @NotNull
    private TipoUsuarioEnum tipo;
}
