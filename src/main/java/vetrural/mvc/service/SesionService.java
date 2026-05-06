package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Sesion;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.repository.SesionRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SesionService {

    @Autowired
    private SesionRepository sesionRepository;

    public Sesion crearSesion(String establecimiento, Usuario anotador, Usuario veterinario) { // Crea una nueva sesion
        Sesion sesion = new Sesion();
        sesion.setEstablecimiento(establecimiento);
        sesion.setFechaHoraInicio(LocalDateTime.now());
        sesion.setAnotador(anotador);
        sesion.setVeterinario(veterinario);
        return sesionRepository.save(sesion);
    }

    public Sesion terminarSesion(Long idSesion) { // Termina una sesion
        Sesion sesion = sesionRepository.findById(idSesion)
                .orElseThrow(() -> new IllegalArgumentException("Sesion no encontrada: " + idSesion));
        sesion.setFechaHoraFin(LocalDateTime.now());
        return sesionRepository.save(sesion);
    }

    public Optional<Sesion> getSesion(Long idSesion) { // Obtiene una sesion por su ID
        return sesionRepository.findById(idSesion);
    }

    public List<Sesion> listarSesiones() { // Obtiene la lista de todas las sesiones registradas en SQL
        return sesionRepository.findAll();
    }

    public Sesion actualizarEstadisticas(Long idSesion, int contBovinos, float acumPeso, int contPrenadas, int contVacias, float edadPromedio) { // Actualiza las estadisticas de una sesion por su ID
        Sesion sesion = sesionRepository.findById(idSesion).orElseThrow(() -> new IllegalArgumentException("Sesion no encontrada"));
        sesion.setContBovinos(contBovinos);
        sesion.setAcumPeso(acumPeso);
        sesion.setContPrenadas(contPrenadas);
        sesion.setContVacias(contVacias);
        sesion.setEdadPromedio(edadPromedio);
        return sesionRepository.save(sesion);
    }
}
