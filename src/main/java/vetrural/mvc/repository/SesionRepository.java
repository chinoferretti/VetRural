package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Sesion;

@Repository
public interface SesionRepository extends JpaRepository<Sesion, Long> {
}
