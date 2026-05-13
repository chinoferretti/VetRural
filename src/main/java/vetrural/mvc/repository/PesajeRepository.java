package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Pesaje;
import java.util.List;
import java.util.Optional;

@Repository
public interface PesajeRepository extends JpaRepository<Pesaje, Long> {
    List<Pesaje> findByBovino(Bovino bovino);
    Optional<Pesaje> findTopByBovinoOrderByFechaHoraDesc(Bovino bovino);
}
