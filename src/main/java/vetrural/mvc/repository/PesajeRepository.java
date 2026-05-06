package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Pesaje;
import java.util.List;

@Repository
public interface PesajeRepository extends JpaRepository<Pesaje, Long> {
    List<Pesaje> findByIdBovino(String idBovino); // Busca pesajes por ID de bovino
}
