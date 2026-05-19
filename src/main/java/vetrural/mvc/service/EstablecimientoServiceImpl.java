package vetrural.mvc.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Establecimiento;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.repository.EstablecimientoRepository;
import java.util.List;
import java.util.Optional;

@Service
public class EstablecimientoServiceImpl implements EstablecimientoService {

    @Autowired
    private EstablecimientoRepository establecimientoRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Override
    public Establecimiento crear(String nombre) {
        Establecimiento e = new Establecimiento();
        e.setNombre(nombre);
        return establecimientoRepository.save(e);
    }

    @Override
    public Optional<Establecimiento> getEstablecimiento(Long id) {
        return establecimientoRepository.findById(id);
    }

    @Override
    public Establecimiento obtenerOFallar(Long id) {
        return establecimientoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Establecimiento no encontrado: " + id));
    }

    @Override
    public List<Establecimiento> listar() {
        return establecimientoRepository.findAll();
    }

    @Override
    public Establecimiento asociarUsuario(Long idEstablecimiento, Long idUsuario) {
        Establecimiento e = obtenerOFallar(idEstablecimiento);
        Usuario u = usuarioService.obtenerOFallar(idUsuario);
        if (!e.getUsuarios().contains(u)) {
            e.getUsuarios().add(u);
            establecimientoRepository.save(e);
        }
        return e;
    }

    @Override
    public Establecimiento desasociarUsuario(Long idEstablecimiento, Long idUsuario) {
        Establecimiento e = obtenerOFallar(idEstablecimiento);
        e.getUsuarios().removeIf(u -> u.getIdUsuario().equals(idUsuario));
        return establecimientoRepository.save(e);
    }

    @Override
    public List<Usuario> getUsuarios(Long idEstablecimiento) {
        return obtenerOFallar(idEstablecimiento).getUsuarios();
    }
}
