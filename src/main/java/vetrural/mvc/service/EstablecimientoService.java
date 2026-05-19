package vetrural.mvc.service;

import vetrural.mvc.entity.Establecimiento;
import vetrural.mvc.entity.Usuario;
import java.util.List;
import java.util.Optional;

public interface EstablecimientoService {
    Establecimiento crear(String nombre);
    Optional<Establecimiento> getEstablecimiento(Long id);
    Establecimiento obtenerOFallar(Long id);
    List<Establecimiento> listar();
    Establecimiento asociarUsuario(Long idEstablecimiento, Long idUsuario);
    Establecimiento desasociarUsuario(Long idEstablecimiento, Long idUsuario);
    List<Usuario> getUsuarios(Long idEstablecimiento);
}
