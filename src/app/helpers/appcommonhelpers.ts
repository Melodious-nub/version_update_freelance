import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable()
export class APPCOMMONHELPERS {

    static numberOnly(event): boolean {
        const charCode = event.which ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    static numberanddotOnly(event): boolean {
        const charCode = event.which ? event.which : event.keyCode;
        if (charCode == 46) {
            return true;
        }
        else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    static roundTo(num: number, places: number) {
        const factor = 10 ** places;
        return Math.round(num * factor) / factor;
    };

    static getProductLabel(item: any): string {
        try {
            if (!item) return '';

            const normalize = (v: any) => {
                const s = v == null ? '' : String(v).trim();
                return s;
            };

            // If item is primitive id, there is no further resolution here; return as string
            if (typeof item === 'string' || typeof item === 'number') {
                return normalize(item);
            }

            // Prefer explicit product codes / SKU
            const codeCandidates = [item.productCode, item.code, item.sku, item.product_code];
            for (const c of codeCandidates) {
                const s = normalize(c);
                if (s) return s;
            }

            // Then try names / descriptions; strip anything after " - " to keep short label
            const nameCandidates = [item.description, item.product_name, item.productName, item.name];
            for (const n of nameCandidates) {
                const s = normalize(n);
                if (s) {
                    const dashIndex = s.indexOf(' - ');
                    if (dashIndex > 0) return s.substring(0, dashIndex).trim();
                    return s;
                }
            }

            // Fallback to id-like fields
            const id = item?.id ?? item?.productId ?? item?.product_id ?? null;
            return id != null ? String(id) : '';
        } catch (e) {
            return '';
        }
    }
}
