package vetrural.mvc.service.Impl;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Establecimiento;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.enumerations.TipoUsuarioEnum;
import vetrural.mvc.repository.UsuarioRepository;
import vetrural.mvc.service.UsuarioService;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Usuario crear(String nombre, String apellido, String email, String contrasena, TipoUsuarioEnum tipo) {
        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Ya existe un usuario con email: " + email);
        }
        Usuario u = new Usuario();
        u.setNombre(nombre);
        u.setApellido(apellido);
        u.setEmail(email);
        u.setContrasena(passwordEncoder.encode(contrasena));
        u.setTipo(tipo);
        return usuarioRepository.save(u);
    }

    @Override
    public Optional<Usuario> getUsuario(Long idUsuario) {
        return usuarioRepository.findById(idUsuario);
    }

    @Override
    public Usuario obtenerOFallar(Long idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + idUsuario));
    }

    @Override
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @Override
    public List<Usuario> listarVeterinarios() {
        return usuarioRepository.findByTipo(TipoUsuarioEnum.Veterinario);
    }

    @Override
    public List<Establecimiento> getEstablecimientos(Long idUsuario) {
        return obtenerOFallar(idUsuario).getEstablecimientos();
    }

    @Override
    public void eliminarUsuario(Long idUsuario) {
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new EntityNotFoundException("Usuario no encontrado: " + idUsuario);
        }
        usuarioRepository.deleteById(idUsuario);
    }

    @Override
    public boolean puedeRegistrarEventoSanitario(Usuario u) {
        return u.getTipo() == TipoUsuarioEnum.Veterinario || u.getTipo() == TipoUsuarioEnum.Otros || u.getTipo() == TipoUsuarioEnum.Productor_Agropecuario;
    }
}
