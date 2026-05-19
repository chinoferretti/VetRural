package vetrural.mvc.service;

import vetrural.mvc.entity.Establecimiento;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.enumerations.TipoUsuarioEnum;
import java.util.List;
import java.util.Optional;

public interface UsuarioService {
    Usuario crear(String nombre, String apellido, String email, String contrasena, TipoUsuarioEnum tipo);
    Optional<Usuario> getUsuario(Long idUsuario);
    Usuario obtenerOFallar(Long idUsuario);
    List<Usuario> listarUsuarios();
    List<Usuario> listarVeterinarios();
    List<Establecimiento> getEstablecimientos(Long idUsuario);
    void eliminarUsuario(Long idUsuario);
    boolean puedeRegistrarEventoSanitario(Usuario u);
}
