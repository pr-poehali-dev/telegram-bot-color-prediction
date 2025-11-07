import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Prediction {
  number: number;
  color: string;
  hash: string;
  key: string;
  timestamp: Date;
}

const Index = () => {
  const [hash, setHash] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState<Prediction | null>(null);
  const [history, setHistory] = useState<Prediction[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const calculateSHA1 = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const getNumberColor = (num: number): string => {
    if (num === 0) return 'green';
    
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
    
    if (redNumbers.includes(num)) return 'red';
    if (blackNumbers.includes(num)) return 'red';
    
    return 'black';
  };

  const handlePredict = async () => {
    if (!hash || !key) {
      toast({
        title: 'Ошибка',
        description: 'Введите хеш и ключ',
        variant: 'destructive'
      });
      return;
    }

    setIsCalculating(true);

    try {
      const calculatedHash = await calculateSHA1(key);
      
      if (calculatedHash !== hash.toLowerCase()) {
        toast({
          title: 'Ошибка проверки',
          description: 'Хеш не совпадает с ключом',
          variant: 'destructive'
        });
        setIsCalculating(false);
        return;
      }

      const numberMatch = key.match(/^(\d+)\|/);
      if (!numberMatch) {
        toast({
          title: 'Ошибка',
          description: 'Неверный формат ключа',
          variant: 'destructive'
        });
        setIsCalculating(false);
        return;
      }

      const number = parseInt(numberMatch[1]);
      const color = getNumberColor(number);

      const prediction: Prediction = {
        number,
        color,
        hash,
        key,
        timestamp: new Date()
      };

      setTimeout(() => {
        setResult(prediction);
        setHistory([prediction, ...history].slice(0, 10));
        setIsCalculating(false);
        
        toast({
          title: 'Предсказание готово! 🎰',
          description: `Результат: ${number} (${color === 'red' ? 'Красное' : color === 'black' ? 'Чёрное' : 'Зелёное'})`
        });
      }, 1500);

    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось вычислить результат',
        variant: 'destructive'
      });
      setIsCalculating(false);
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-casino-red text-white';
      case 'black':
        return 'bg-casino-black text-white';
      case 'green':
        return 'bg-casino-green text-white';
      default:
        return 'bg-muted';
    }
  };

  const getColorName = (color: string) => {
    switch (color) {
      case 'red':
        return 'Красное';
      case 'black':
        return 'Чёрное';
      case 'green':
        return 'Зелёное';
      default:
        return color;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-full mb-4 animate-glow-pulse shadow-2xl shadow-casino-gold/50">
            <span className="text-4xl">🎰</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-casino-gold via-casino-gold-dark to-casino-gold">
            QALAIS BOT
          </h1>
          <p className="text-xl text-muted-foreground">Система предсказаний для рулетки</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-casino-gold/30 shadow-lg shadow-casino-gold/10 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Icon name="KeyRound" className="text-casino-gold" size={28} />
                Ввод данных
              </CardTitle>
              <CardDescription>Введите хеш игры и ключ для предсказания</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hash" className="text-casino-gold font-semibold">Хеш игры</Label>
                <Input
                  id="hash"
                  placeholder="fb92946b8e464a14ba164c990f565434dfc9dd4e"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  className="bg-muted border-casino-gold/50 focus:border-casino-gold font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key" className="text-casino-gold font-semibold">Ключ</Label>
                <Input
                  id="key"
                  placeholder="0|yG7GH+_vOm"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="bg-muted border-casino-gold/50 focus:border-casino-gold font-mono"
                />
              </div>

              <Button
                onClick={handlePredict}
                disabled={isCalculating}
                className="w-full bg-gradient-to-r from-casino-gold to-casino-gold-dark hover:from-casino-gold-dark hover:to-casino-gold text-casino-black font-bold text-lg py-6 shadow-lg shadow-casino-gold/30"
              >
                {isCalculating ? (
                  <>
                    <Icon name="Loader2" className="animate-spin mr-2" size={20} />
                    Вычисление...
                  </>
                ) : (
                  <>
                    <Icon name="Sparkles" className="mr-2" size={20} />
                    Предсказать
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-casino-gold/30 shadow-lg shadow-casino-gold/10 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Icon name="Trophy" className="text-casino-gold" size={28} />
                Результат
              </CardTitle>
              <CardDescription>Предсказание цвета и числа</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center p-8 rounded-xl bg-gradient-to-br from-muted to-muted/50 border-2 border-casino-gold/50 shadow-xl">
                    <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full text-6xl font-black mb-4 ${getColorClass(result.color)} shadow-2xl`}>
                      {result.number}
                    </div>
                    <div className="text-3xl font-bold text-casino-gold mb-2">
                      {getColorName(result.color)}
                    </div>
                    <Badge variant="outline" className="text-xs border-casino-gold/50 text-muted-foreground">
                      SHA-1 проверен
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                      <Icon name="Hash" className="text-casino-gold mt-0.5" size={16} />
                      <div className="flex-1 break-all">
                        <span className="text-muted-foreground">Хеш:</span>
                        <span className="font-mono ml-2 text-foreground">{result.hash}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                      <Icon name="Key" className="text-casino-gold mt-0.5" size={16} />
                      <div className="flex-1 break-all">
                        <span className="text-muted-foreground">Ключ:</span>
                        <span className="font-mono ml-2 text-foreground">{result.key}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Icon name="Info" className="mx-auto mb-4 text-casino-gold" size={48} />
                  <p>Введите данные и нажмите "Предсказать"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {history.length > 0 && (
          <Card className="border-casino-gold/30 shadow-lg shadow-casino-gold/10 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Icon name="History" className="text-casino-gold" size={28} />
                История предсказаний
              </CardTitle>
              <CardDescription>Последние 10 проверок</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold ${getColorClass(item.color)} shadow-lg`}>
                      {item.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-casino-gold">
                        {getColorName(item.color)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate font-mono">
                        {item.hash}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.timestamp.toLocaleTimeString('ru-RU')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Card className="border-casino-gold/30 bg-card/95 backdrop-blur inline-block">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Icon name="Shield" className="text-casino-gold" size={20} />
                <span>Все расчёты выполняются через SHA-1 алгоритм</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
