package vetrural.mvc.entity;

import vetrural.mvc.enumerations.RazaBovinoEnum;
import vetrural.mvc.enumerations.TipoBovinoEnum;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Bovino")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class Bovino extends Animal {
    @Enumerated(EnumType.STRING)
    private RazaBovinoEnum raza;
    @Enumerated(EnumType.STRING)
    private TipoBovinoEnum tipo; 
}
