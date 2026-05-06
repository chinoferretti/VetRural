package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Boqueo;
import java.util.List;

@Repository
public interface BoqueoRepository extends JpaRepository<Boqueo, Long> {
    List<Boqueo> findByIdBovino(String idBovino); // Busca bloqueos por ID de bovino
}
