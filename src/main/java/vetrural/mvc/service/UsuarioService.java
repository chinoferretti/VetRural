package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.enumerations.TipoUsuarioEnum;
import vetrural.mvc.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public boolean existeVeterinario(Long idVet) { // Verifica si existe un veterinario por su ID
        return usuarioRepository.findById(idVet).map(u -> u.getTipo() == TipoUsuarioEnum.Veterinario).orElse(false);
    }

    public Optional<Usuario> getVeterinario(Long idVet) { // Obtiene un veterinario por su ID, verificando que el tipo de usuario sea Veterinario
        return usuarioRepository.findById(idVet).filter(u -> u.getTipo() == TipoUsuarioEnum.Veterinario);
    }

    public Optional<Usuario> getUsuario(Long idUsuario) { // Obtiene un usuario por su ID
        return usuarioRepository.findById(idUsuario);
    }

    public Usuario guardarUsuario(Usuario usuario) { // Guarda un nuevo usuario o actualiza uno existente en SQL
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> listarUsuarios() { // Obtiene la lista de todos los usuarios registrados en SQL
        return usuarioRepository.findAll();
    }

    public List<Usuario> listarVeterinarios() { // Obtiene la lista de todos los veterinarios registrados en SQL
        return usuarioRepository.findByTipo(TipoUsuarioEnum.Veterinario);
    }

    public void eliminarUsuario(Long idUsuario) { // Elimina un usuario por su ID de SQL
        usuarioRepository.deleteById(idUsuario);
    }
}
