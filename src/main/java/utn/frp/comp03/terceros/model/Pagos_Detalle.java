package utn.frp.comp03.terceros.model;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="pagos_detalle")
public class Pagos_Detalle {
	
	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    @Column(name = "id_pagosdetalle")
	    private Long id;

	    @Column(name = "instrumentnumber")
	    private String instrumentNumber;

	    @Column(name = "instrumentdate")
	    private LocalDate instrumentDate;
	    
	    @Column(name = "banco")
	    private String banco;
	    
	    @Column(name = "pagorealizado")
	    private Boolean pagoRealizado;

	    @OneToOne
	    @JoinColumn(name = "id_pagos")
	    @JsonIgnore // Evita referencia circular
	    private Pagos pago;
	    
	    @Column(name = "id_pagos", insertable = false, updatable = false)
	    private Long idPago; // Mostrar el id_pago en el JSON
	    
		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}

		public String getInstrumentNumber() {
			return instrumentNumber;
		}

		public void setInstrumentNumber(String instrumentNumber) {
			this.instrumentNumber = instrumentNumber;
		}

		public LocalDate getInstrumentDate() {
			return instrumentDate;
		}

		public void setInstrumentDate(LocalDate instrumentDate) {
			this.instrumentDate = instrumentDate;
		}

		public String getBanco() {
			return banco;
		}

		public void setBanco(String banco) {
			this.banco = banco;
		}

		public Boolean getPagoRealizado() {
			return pagoRealizado;
		}

		public void setPagoRealizado(Boolean pagoRealizado) {
			this.pagoRealizado = pagoRealizado;
		}

		public Pagos getPago() {
			return pago;
		}

		public void setPago(Pagos pago) {
			this.pago = pago;
		}

		public Long getIdPago() {
			return idPago;
		}

		public void setIdPago(Long idPago) {
			this.idPago = idPago;
		}

	}

