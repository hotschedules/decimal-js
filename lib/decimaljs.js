function Decimal(num) {
    if(this.constructor != Decimal) {
        return new Decimal(num);
    }

    if(num instanceof Decimal) {
        return num;
    }

    this.internal = String(num);
    this.repr = this._get_repr();
}

Decimal.prototype._get_repr = function() {
    var tokens = this.internal.split('.');

    var pre = tokens[0];
    var post = tokens[1];
    var value = '';
    var exp = '';


    if(!post) {
       var trailing_zeros = pre.match(/0+$/);

        if(trailing_zeros) {
            var l = trailing_zeros[0].length;
            value = pre.substr(0, pre.length - l);
            exp = l;
        } else {
            value = pre;
            exp = 0;
        }
    } else {
        value = parseInt(this.internal.split('.').join(''), 10);
        exp = post.length * -1;
    }

    return {'value':value, 'exp':exp};
}


Decimal.prototype.add = function(target) {
    target = Decimal(target);
    
    var ops = [this, target];
    ops.sort(function(x, y) { return x.repr.exp - y.repr.exp });
    
    var smallest = ops[0].repr.exp;
    var biggest = ops[1].repr.exp;

    var fst = Decimal._format(ops[1].repr.value, biggest - smallest) * 1;
    var snd = ops[0].repr.value * 1;
    
    var calc = String(fst + snd);
    
    return Decimal._format(calc, smallest);
}

Decimal.prototype.sub = function(target) {
    return this.add(target * -1);
}

Decimal.prototype.mul = function(target) {
    target = Decimal(target);
    var calc = String(this.repr.value * target.repr.value)

    return Decimal._format(calc, this.repr.exp + target.repr.exp);
}

Decimal.prototype.div = function(target) {
    target = Decimal(target);
    
    var smallest = Math.min(this.repr.exp, target.repr.exp); 
    
    var x = Decimal.mul(Math.pow(10, Math.abs(smallest)), this);
    var y = Decimal.mul(Math.pow(10, Math.abs(smallest)), target);
    
    return(x /y)
}

Decimal.prototype.toString = function() {
    return this.internal;
}

Decimal._neg_exp = function(str, position) {
    position = Math.abs(position);
    
    var offset = position - str.length;
    var sep = Decimal.SEPARATOR;

    if(offset >= 0) {
        str = Decimal.__zero(offset) + str;
        sep = '0.';
    }
    
    var length = str.length;
    var head = str.substr(0, length - position);
    var tail = str.substring(length  - position, length).replace(/\./g, ''); // FIXME : Awful hack
    return head + sep + tail;
}

Decimal._pos_exp = function(str, exp) {
    var zeros = Decimal.__zero(exp);
    return String(str + zeros);
}

Decimal._format = function(num, exp) {
    var method = exp >= 0 ? '_pos_exp' : '_neg_exp';
    return Decimal[method](String(num), exp);
}

Decimal.__zero = function(exp) {
    return new Array(exp + 1).join('0');
};

Decimal.SEPARATOR = '.';

(function() {
    //Generics
    var methods = ['add','mul', 'sub', 'div'];

    for(var i=0; i < methods.length; i++) {
        (function(method) {
            Decimal[method] = function(a, b) {
                return Decimal(a)[method](b);
            }
        })(methods[i]);
    }
})();