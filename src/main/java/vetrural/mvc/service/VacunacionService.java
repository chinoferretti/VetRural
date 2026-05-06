package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Vacunacion;
import vetrural.mvc.repository.VacunacionRepository;
import java.time.LocalDate;
import java.util.List;

@Service
public class VacunacionService {

    @Autowired
    private VacunacionRepository vacunacionRepository;

    public Vacunacion registrarVacunacion(String idBovino, LocalDate aftosa, LocalDate brucelosis, LocalDate carbunco, LocalDate clostridial, LocalDate ibrBvd) { // Registra una nueva vacunación para un bovino, incluyendo las fechas de cada vacuna
        Vacunacion vacunacion = new Vacunacion();
        vacunacion.setIdBovino(idBovino);
        vacunacion.setAftosa(aftosa);
        vacunacion.setBrucelosis(brucelosis);
        vacunacion.setCarbunco(carbunco);
        vacunacion.setClostridial(clostridial);
        vacunacion.setIbr_bvd(ibrBvd);
        return vacunacionRepository.save(vacunacion);
    }

    public List<Vacunacion> getVacunacionesPorBovino(String idBovino) { // Obtiene la lista de vacunaciones de un bovino especifico por su ID
        return vacunacionRepository.findByIdBovino(idBovino);
    }

    public List<Vacunacion> listarVacunaciones() { // Obtiene la lista de todas las vacunaciones registradas en SQL
        return vacunacionRepository.findAll();
    }
}
