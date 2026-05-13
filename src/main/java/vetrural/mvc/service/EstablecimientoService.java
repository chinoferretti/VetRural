package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Establecimiento;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.repository.EstablecimientoRepository;
import java.util.List;
import java.util.Optional;

@Service
public class EstablecimientoService {

    @Autowired
    private EstablecimientoRepository establecimientoRepository;

    @Autowired
    private UsuarioService usuarioService;

    public Establecimiento crear(String nombre) {
        Establecimiento e = new Establecimiento();
        e.setNombre(nombre);
        return establecimientoRepository.save(e);
    }

    public Optional<Establecimiento> getEstablecimiento(Long id) {
        return establecimientoRepository.findById(id);
    }

    public Establecimiento obtenerOFallar(Long id) {
        return establecimientoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Establecimiento no encontrado: " + id));
    }

    public List<Establecimiento> listar() {
        return establecimientoRepository.findAll();
    }

    public Establecimiento asociarUsuario(Long idEstablecimiento, Long idUsuario) {
        Establecimiento e = obtenerOFallar(idEstablecimiento);
        Usuario u = usuarioService.getUsuario(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + idUsuario));
        if (!e.getUsuarios().contains(u)) {
            e.getUsuarios().add(u);
            establecimientoRepository.save(e);
        }
        return e;
    }

    public Establecimiento desasociarUsuario(Long idEstablecimiento, Long idUsuario) {
        Establecimiento e = obtenerOFallar(idEstablecimiento);
        e.getUsuarios().removeIf(u -> u.getIdUsuario().equals(idUsuario));
        return establecimientoRepository.save(e);
    }

    public List<Usuario> getUsuarios(Long idEstablecimiento) {
        return obtenerOFallar(idEstablecimiento).getUsuarios();
    }
}
