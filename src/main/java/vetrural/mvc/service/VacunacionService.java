package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.entity.Vacunacion;
import vetrural.mvc.enumerations.VacunaTipoEnum;
import vetrural.mvc.repository.VacunacionRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VacunacionService {

    @Autowired
    private VacunacionRepository vacunacionRepository;

    public Vacunacion registrarVacunacion(Bovino bovino, Usuario registradoPor, VacunaTipoEnum vacuna) {
        Vacunacion v = new Vacunacion();
        v.setBovino(bovino);
        v.setRegistradoPor(registradoPor);
        v.setFechaHora(LocalDateTime.now());
        v.setVacuna(vacuna);
        return vacunacionRepository.save(v);
    }

    public List<Vacunacion> getVacunacionesPorBovino(Bovino bovino) {
        return vacunacionRepository.findByBovinoOrderByFechaHoraDesc(bovino);
    }

    public List<Vacunacion> listarVacunaciones() {
        return vacunacionRepository.findAll();
    }
}
