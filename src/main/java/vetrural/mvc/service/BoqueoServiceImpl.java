package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Boqueo;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.enumerations.DentaduraEnum;
import vetrural.mvc.enumerations.DeterioroEnum;
import vetrural.mvc.enumerations.DientesEnum;
import vetrural.mvc.repository.BoqueoRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BoqueoServiceImpl implements BoqueoService {

    @Autowired
    private BoqueoRepository boqueoRepository;

    @Override
    public Boqueo registrarBoqueo(Bovino bovino, Usuario registradoPor, DientesEnum dientes, DeterioroEnum deterioro, DentaduraEnum dentadura) {
        Boqueo boqueo = new Boqueo();
        boqueo.setBovino(bovino);
        boqueo.setRegistradoPor(registradoPor);
        boqueo.setFechaHora(LocalDateTime.now());
        boqueo.setDientes(dientes);
        boqueo.setDeterioro(deterioro);
        boqueo.setDentadura(dentadura);
        return boqueoRepository.save(boqueo);
    }

    @Override
    public List<Boqueo> getBoqueosPorBovino(Bovino bovino) {
        return boqueoRepository.findByBovino(bovino);
    }

    @Override
    public Optional<Boqueo> getUltimoBoqueo(Bovino bovino) {
        return boqueoRepository.findTopByBovinoOrderByFechaHoraDesc(bovino);
    }

    @Override
    public List<Boqueo> listarBoqueos() {
        return boqueoRepository.findAll();
    }
}
