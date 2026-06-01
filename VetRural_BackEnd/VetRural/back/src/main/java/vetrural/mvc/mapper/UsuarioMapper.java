package vetrural.mvc.mapper;

import vetrural.mvc.dto.response.UsuarioResponse;
import vetrural.mvc.entity.Usuario;

public final class UsuarioMapper {

    private UsuarioMapper() {}

    public static UsuarioResponse toResponse(Usuario u) {
        return new UsuarioResponse(
                u.getIdUsuario(),
                u.getNombre(),
                u.getApellido(),
                u.getEmail(),
                u.getTipo()
        );
    }
}
