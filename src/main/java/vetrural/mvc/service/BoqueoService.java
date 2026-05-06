package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Boqueo;
import vetrural.mvc.enumerations.DentaduraEnum;
import vetrural.mvc.enumerations.DeterioroEnum;
import vetrural.mvc.enumerations.DientesEnum;
import vetrural.mvc.repository.BoqueoRepository;
import java.util.List;

@Service
public class BoqueoService {

    @Autowired
    private BoqueoRepository boqueoRepository;

    public Boqueo registrarBoqueo(String idBovino, DientesEnum dientes, DeterioroEnum deterioro, DentaduraEnum dentadura) { // Registra un nuevo boqueo para un bovino y lo guarda en SQL
        Boqueo boqueo = new Boqueo();
        boqueo.setIdBovino(idBovino);
        boqueo.setDientes(dientes);
        boqueo.setDeterioro(deterioro);
        boqueo.setDentadura(dentadura);
        return boqueoRepository.save(boqueo);
    }

    public List<Boqueo> getBoqueosPorBovino(String idBovino) { // Obtiene la lista de boqueos de un bovino específico por su ID
        return boqueoRepository.findByIdBovino(idBovino);
    }

    public List<Boqueo> listarBoqueos() { // Obtiene la lista de todos los boqueos registrados en SQL
        return boqueoRepository.findAll();
    }
}
