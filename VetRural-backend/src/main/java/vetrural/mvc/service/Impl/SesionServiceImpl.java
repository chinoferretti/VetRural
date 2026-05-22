package vetrural.mvc.service.Impl;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Establecimiento;
import vetrural.mvc.entity.Sesion;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.enumerations.TipoUsuarioEnum;
import vetrural.mvc.repository.SesionRepository;
import vetrural.mvc.service.EstablecimientoService;
import vetrural.mvc.service.SesionService;
import vetrural.mvc.service.UsuarioService;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SesionServiceImpl implements SesionService {

    @Autowired
    private SesionRepository sesionRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private EstablecimientoService establecimientoService;

    @Override
    public Sesion crear(Long veterinarioId, String anotador, Long establecimientoId) {
        Usuario veterinario = usuarioService.obtenerOFallar(veterinarioId);
        if (veterinario.getTipo() != TipoUsuarioEnum.Veterinario) {
            throw new IllegalArgumentException("El usuario " + veterinarioId + " no es veterinario");
        }
        Establecimiento establecimiento = establecimientoService.obtenerOFallar(establecimientoId);

        Sesion sesion = new Sesion();
        sesion.setFechaHora(LocalDateTime.now());
        sesion.setVeterinario(veterinario);
        sesion.setAnotador(anotador != null && !anotador.isBlank() ? anotador : null);
        sesion.setEstablecimiento(establecimiento);
        return sesionRepository.save(sesion);
    }

    @Override
    public Sesion obtenerOFallar(Long id) {
        return sesionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sesión no encontrada: " + id));
    }

    @Override
    public List<Sesion> listarPorEstablecimiento(Long establecimientoId) {
        Establecimiento establecimiento = establecimientoService.obtenerOFallar(establecimientoId);
        return sesionRepository.findByEstablecimientoOrderByFechaHoraDesc(establecimiento);
    }
}
