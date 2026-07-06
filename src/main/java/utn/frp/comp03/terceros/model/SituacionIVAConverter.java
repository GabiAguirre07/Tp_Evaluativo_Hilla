package utn.frp.comp03.terceros.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class SituacionIVAConverter 
        implements AttributeConverter<Terceros.SituacionIVA, String> {

    @Override
    public String convertToDatabaseColumn(Terceros.SituacionIVA attr) {
        if (attr == null) return null;
        return attr.getDescripcion(); // guarda "Responsable Inscripto" etc.
    }

    @Override
    public Terceros.SituacionIVA convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        for (Terceros.SituacionIVA v : Terceros.SituacionIVA.values()) {
            if (v.getDescripcion().equals(dbData) || v.name().equals(dbData)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Valor desconocido en sitiva: " + dbData);
    }
}