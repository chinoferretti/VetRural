package vetrural.mvc.service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.entity.Vacunacion;
import vetrural.mvc.enumerations.VacunaTipoEnum;
import vetrural.mvc.repository.VacunacionRepository;
import vetrural.mvc.service.VacunacionService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VacunacionServiceImpl implements VacunacionService {

    @Autowired
    private VacunacionRepository vacunacionRepository;

    @Override
    public Vacunacion registrarVacunacion(Bovino bovino, Usuario registradoPor, VacunaTipoEnum vacuna) {
        return registrarVacunacion(bovino, registradoPor, vacuna, null);
    }

    @Override
    public Vacunacion registrarVacunacion(Bovino bovino, Usuario registradoPor, VacunaTipoEnum vacuna, LocalDate fechaAplicacion) {
        Vacunacion v = new Vacunacion();
        v.setBovino(bovino);
        v.setRegistradoPor(registradoPor);
        v.setFechaHora(fechaAplicacion != null ? fechaAplicacion.atStartOfDay() : LocalDateTime.now());
        v.setVacuna(vacuna);
        return vacunacionRepository.save(v);
    }

    @Override
    public List<Vacunacion> getVacunacionesPorBovino(Bovino bovino) {
        return vacunacionRepository.findByBovinoOrderByFechaHoraDesc(bovino);
    }

    @Override
    public List<Vacunacion> listarVacunaciones() {
        return vacunacionRepository.findAll();
    }
}
