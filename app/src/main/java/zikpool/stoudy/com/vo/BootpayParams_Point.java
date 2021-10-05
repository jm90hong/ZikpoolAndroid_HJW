package zikpool.stoudy.com.vo;

public class BootpayParams_Point {
    private String orderId=null;
    private int buyerIdx=0;
    private int chargedPoint=0;
    private int bonusPoint=0;
    private String productCode=null;
    private String productName=null;
    private int vos=0;
    private int vat=0;


    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public int getVos() {
        return vos;
    }

    public void setVos(int vos) {
        this.vos = vos;
    }

    public int getVat() {
        return vat;
    }

    public void setVat(int vat) {
        this.vat = vat;
    }

    public int getBuyerIdx() {
        return buyerIdx;
    }

    public void setBuyerIdx(int buyerIdx) {
        this.buyerIdx = buyerIdx;
    }

    public int getChargedPoint() {
        return chargedPoint;
    }

    public void setChargedPoint(int chargedPoint) {
        this.chargedPoint = chargedPoint;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductCode() {
        return productCode;
    }

    public void setProductCode(String productCode) {
        this.productCode = productCode;
    }

    public int getBonusPoint() {
        return bonusPoint;
    }

    public void setBonusPoint(int bonusPoint) {
        this.bonusPoint = bonusPoint;
    }
}
