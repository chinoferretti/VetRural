package vetrural.mvc.entity;

import jakarta.persistence.*;
import lombok.*;
import vetrural.mvc.enumerations.DientesEnum;
import vetrural.mvc.enumerations.DeterioroEnum;
import vetrural.mvc.enumerations.DentaduraEnum;

@Entity
@Table(name = "Boqueo")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class Boqueo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idBoqueo;

    private String idBovino;

    @Enumerated(EnumType.STRING)
    private DientesEnum dientes;
    @Enumerated(EnumType.STRING)
    private DeterioroEnum deterioro;
    @Enumerated(EnumType.STRING)
    private DentaduraEnum dentadura;
}
