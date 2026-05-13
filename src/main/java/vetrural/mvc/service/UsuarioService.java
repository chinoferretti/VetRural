package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Establecimiento;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.enumerations.TipoUsuarioEnum;
import vetrural.mvc.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario crear(String nombre, String apellido, String email, String contrasena, TipoUsuarioEnum tipo) {
        Usuario u = new Usuario();
        u.setNombre(nombre);
        u.setApellido(apellido);
        u.setEmail(email);
        u.setContrasena(contrasena);
        u.setTipo(tipo);
        return usuarioRepository.save(u);
    }

    public Optional<Usuario> getUsuario(Long idUsuario) {
        return usuarioRepository.findById(idUsuario);
    }

    public Usuario obtenerOFallar(Long idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + idUsuario));
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public List<Usuario> listarVeterinarios() {
        return usuarioRepository.findByTipo(TipoUsuarioEnum.Veterinario);
    }

    public List<Establecimiento> getEstablecimientos(Long idUsuario) {
        return obtenerOFallar(idUsuario).getEstablecimientos();
    }

    public void eliminarUsuario(Long idUsuario) {
        usuarioRepository.deleteById(idUsuario);
    }

    public boolean puedeRegistrarEventoSanitario(Usuario u) {
        return u.getTipo() == TipoUsuarioEnum.Veterinario || u.getTipo() == TipoUsuarioEnum.Anotador;
    }
}
